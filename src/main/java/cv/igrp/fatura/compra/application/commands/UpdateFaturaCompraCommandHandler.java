package cv.igrp.fatura.compra.application.commands;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ProdutoEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraItemDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraItemImpostoDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraItemEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraItemImpostoEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrImpostoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrFaturaTipoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrImpostoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrUnidadeRepository;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.framework.core.domain.CommandHandler;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class UpdateFaturaCompraCommandHandler implements CommandHandler<UpdateFaturaCompraCommand, ResponseEntity<FaturaCompraEntity>> {

    private static final Logger LOGGER = LoggerFactory.getLogger(UpdateFaturaCompraCommandHandler.class);

    private final FaturaCompraRepository faturaCompraRepo;
    private final FornecedorRepository fornecedorRepo;
    private final PrFaturaTipoRepository tipoRepo;
    private final PrImpostoRepository impostoRepo;
    private final PrUnidadeRepository unidadeRepo;
    private final ProdutoRepository produtoRepo;

    @Override
    @Transactional
    public ResponseEntity<FaturaCompraEntity> handle(UpdateFaturaCompraCommand command) {
        FaturaCompraEntity fatura = faturaCompraRepo.findById(command.getId())
                .orElseThrow(() -> IgrpResponseStatusException.of(
                        HttpStatus.NOT_FOUND, "Fatura de compra não encontrada: " + command.getId()));

        if (!"RASCUNHO".equals(fatura.getEstado())) {
            throw IgrpResponseStatusException.of(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Apenas faturas em estado RASCUNHO podem ser editadas. Estado atual: " + fatura.getEstado());
        }

        FaturaCompraCreateDTO dto = command.getDto();

        FornecedorEntity fornecedor = fornecedorRepo.findById(dto.getFornecedorId())
                .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Fornecedor não encontrado: " + dto.getFornecedorId()));

        var tipoFatura = tipoRepo.findById(dto.getTipoFaturaId())
                .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Tipo de fatura não encontrado: " + dto.getTipoFaturaId()));

        fatura.setCodigoReferencia(dto.getCodigoReferencia());
        fatura.setTipoFatura(tipoFatura);
        fatura.setDtFaturacao(dto.getDtFaturacao());
        fatura.setLimitFaturacao(dto.getLimitFaturacao());
        fatura.setDtVencimentoFatura(dto.getDtVencimentoFatura());
        fatura.setFornecedor(fornecedor);
        fatura.setTermCondicoes(dto.getTermCondicoes());
        fatura.setNota(dto.getNota());

        fatura.getItems().clear();

        BigDecimal totalIliquido = BigDecimal.ZERO;
        BigDecimal totalImposto = BigDecimal.ZERO;

        for (FaturaCompraItemDTO itemDto : dto.getItems()) {
            FaturaCompraItemEntity item = new FaturaCompraItemEntity();
            item.setFaturaCompra(fatura);
            item.setNumLinha(itemDto.getNumLinha());
            item.setDescr(itemDto.getDescr());
            item.setQuantidade(itemDto.getQuantidade());
            item.setEstado("ATIVO");

            if (itemDto.getProdutoId() != null) {
                ProdutoEntity produto = produtoRepo.findById(itemDto.getProdutoId())
                        .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Produto não encontrado: " + itemDto.getProdutoId()));
                item.setProduto(produto);
                item.setDesig(itemDto.getDesig() != null && !itemDto.getDesig().isBlank()
                        ? itemDto.getDesig() : produto.getDesig());
                item.setCodigoArtigo(itemDto.getCodigoArtigo() != null && !itemDto.getCodigoArtigo().isBlank()
                        ? itemDto.getCodigoArtigo() : produto.getCodigo());
                item.setPrecoUnitario(itemDto.getPrecoUnitario() != null
                        ? itemDto.getPrecoUnitario() : produto.getPreco());
                if (itemDto.getPrUnidadeId() == null && produto.getPrUnidade() != null) {
                    item.setPrUnidade(produto.getPrUnidade());
                }
            } else {
                if (itemDto.getDesig() == null || itemDto.getDesig().isBlank()) {
                    throw IgrpResponseStatusException.of(HttpStatus.BAD_REQUEST,
                            "Linha " + itemDto.getNumLinha() + ": 'desig' obrigatório quando 'produtoId' não é fornecido");
                }
                if (itemDto.getPrecoUnitario() == null) {
                    throw IgrpResponseStatusException.of(HttpStatus.BAD_REQUEST,
                            "Linha " + itemDto.getNumLinha() + ": 'precoUnitario' obrigatório quando 'produtoId' não é fornecido");
                }
                item.setDesig(itemDto.getDesig());
                item.setCodigoArtigo(itemDto.getCodigoArtigo());
                item.setPrecoUnitario(itemDto.getPrecoUnitario());
            }

            if (itemDto.getPrUnidadeId() != null) {
                unidadeRepo.findById(itemDto.getPrUnidadeId()).ifPresent(item::setPrUnidade);
            }
            if (itemDto.getContaGlId() != null) {
                item.setContaGlId(itemDto.getContaGlId());
            }

            BigDecimal valorBruto = itemDto.getQuantidade().multiply(item.getPrecoUnitario()).setScale(4, RoundingMode.HALF_UP);
            item.setValorBruto(valorBruto);

            BigDecimal descontoComercialValor = BigDecimal.ZERO;
            if (itemDto.getDescontoComercialPerc() != null && itemDto.getDescontoComercialPerc().compareTo(BigDecimal.ZERO) > 0) {
                descontoComercialValor = valorBruto.multiply(itemDto.getDescontoComercialPerc()).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                item.setDescontoComercialPerc(itemDto.getDescontoComercialPerc());
                item.setDescontoComercialValor(descontoComercialValor);
            }

            BigDecimal descontoFinanceiroValor = BigDecimal.ZERO;
            if (itemDto.getDescontoFinanceiroPerc() != null && itemDto.getDescontoFinanceiroPerc().compareTo(BigDecimal.ZERO) > 0) {
                descontoFinanceiroValor = valorBruto.subtract(descontoComercialValor)
                        .multiply(itemDto.getDescontoFinanceiroPerc()).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                item.setDescontoFinanceiroPerc(itemDto.getDescontoFinanceiroPerc());
                item.setDescontoFinanceiroValor(descontoFinanceiroValor);
            }

            BigDecimal valorLiquido = valorBruto.subtract(descontoComercialValor).subtract(descontoFinanceiroValor).setScale(4, RoundingMode.HALF_UP);
            item.setValorLiquido(valorLiquido);

            BigDecimal itemTotalImposto = BigDecimal.ZERO;
            item.setImpostos(new ArrayList<>());

            if (itemDto.getImpostos() != null) {
                for (FaturaCompraItemImpostoDTO impostoDto : itemDto.getImpostos()) {
                    PrImpostoEntity imposto = impostoRepo.findById(impostoDto.getImpostoId())
                            .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Imposto não encontrado: " + impostoDto.getImpostoId()));

                    String tipoCalculo = (impostoDto.getTipoCalculo() != null && !impostoDto.getTipoCalculo().isBlank())
                            ? impostoDto.getTipoCalculo() : imposto.getTipoCalculo();
                    BigDecimal base = impostoDto.getBaseCalculo() != null ? impostoDto.getBaseCalculo() : valorLiquido;

                    BigDecimal taxa = null;
                    BigDecimal valorFixo = null;
                    BigDecimal valorImpostoCalc;

                    if ("PERCENTAGEM".equals(tipoCalculo)) {
                        taxa = impostoDto.getTaxa() != null ? impostoDto.getTaxa()
                                : (imposto.getValor() != null ? imposto.getValor() : BigDecimal.ZERO);
                        valorImpostoCalc = base.multiply(taxa).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
                    } else {
                        valorFixo = impostoDto.getValorFixo() != null ? impostoDto.getValorFixo()
                                : (imposto.getValor() != null ? imposto.getValor() : BigDecimal.ZERO);
                        valorImpostoCalc = valorFixo;
                    }

                    BigDecimal valorImpostoFinal = impostoDto.getValorImposto() != null
                            ? impostoDto.getValorImposto() : valorImpostoCalc;

                    FaturaCompraItemImpostoEntity itemImposto = new FaturaCompraItemImpostoEntity();
                    itemImposto.setFaturaCompraItem(item);
                    itemImposto.setImposto(imposto);
                    itemImposto.setTipoCalculo(tipoCalculo);
                    itemImposto.setBaseCalculo(base);
                    itemImposto.setTaxa(taxa);
                    itemImposto.setValorFixo(valorFixo);
                    itemImposto.setValorImposto(valorImpostoFinal);
                    itemImposto.setMotivoNaoAplicarImposto(impostoDto.getMotivoNaoAplicarImposto());
                    itemImposto.setContaGlId(impostoDto.getContaGlId());
                    itemImposto.setOrdem(impostoDto.getOrdem());

                    item.getImpostos().add(itemImposto);
                    itemTotalImposto = itemTotalImposto.add(valorImpostoFinal);
                }
            }

            item.setValorImposto(itemTotalImposto);
            item.setValorTotal(valorLiquido.add(itemTotalImposto).setScale(4, RoundingMode.HALF_UP));

            fatura.getItems().add(item);
            totalIliquido = totalIliquido.add(valorBruto);
            totalImposto = totalImposto.add(itemTotalImposto);
        }

        fatura.setValorIliquido(totalIliquido.setScale(2, RoundingMode.HALF_UP));
        fatura.setValorImposto(totalImposto.setScale(2, RoundingMode.HALF_UP));
        BigDecimal valorFatura = totalIliquido.add(totalImposto).setScale(2, RoundingMode.HALF_UP);
        fatura.setValorFatura(valorFatura);
        fatura.setValorPorPagar(valorFatura);

        FaturaCompraEntity saved = faturaCompraRepo.save(fatura);
        LOGGER.info("FaturaCompra atualizada: {} ({})", saved.getCodigo(), saved.getId());
        return ResponseEntity.ok(saved);
    }
}
