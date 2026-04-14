package cv.igrp.fatura.compra.application.commands;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ProdutoEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrImpostoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrUnidadeEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrFaturaTipoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrImpostoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrSerieRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrUnidadeRepository;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.fatura.compra.application.dto.*;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.*;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.*;
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
public class CreateFaturaCompraCommandHandler implements CommandHandler<CreateFaturaCompraCommand, ResponseEntity<FaturaCompraEntity>> {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreateFaturaCompraCommandHandler.class);

    private final FaturaCompraRepository faturaCompraRepo;
    private final FaturaCompraItemRepository itemRepo;
    private final FaturaCompraItemImpostoRepository impostoItemRepo;
    private final FornecedorRepository fornecedorRepo;
    private final PrFaturaTipoRepository tipoRepo;
    private final PrSerieRepository serieRepo;
    private final PrImpostoRepository impostoRepo;
    private final PrUnidadeRepository unidadeRepo;
    private final ProdutoRepository produtoRepo;

    @Override
    @Transactional
    public ResponseEntity<FaturaCompraEntity> handle(CreateFaturaCompraCommand command) {
        FaturaCompraCreateDTO dto = command.getDto();

        FornecedorEntity fornecedor = fornecedorRepo.findById(dto.getFornecedorId())
                .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Fornecedor não encontrado: " + dto.getFornecedorId()));

        var tipoFatura = tipoRepo.findById(dto.getTipoFaturaId())
                .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Tipo de fatura não encontrado: " + dto.getTipoFaturaId()));

        PrSerieEntity serie = serieRepo.findById(dto.getPrSerieId())
                .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Série não encontrada: " + dto.getPrSerieId()));

        // Increment serie counter
        serie.setContador(serie.getContador() + 1);
        serieRepo.save(serie);

        // Create fatura
        FaturaCompraEntity fatura = new FaturaCompraEntity();
        fatura.setCodigo(serie.getCodigo() + "-" + serie.getContador());
        fatura.setCodigoReferencia(dto.getCodigoReferencia());
        fatura.setTipoFatura(tipoFatura);
        fatura.setDtFaturacao(dto.getDtFaturacao());
        fatura.setLimitFaturacao(dto.getLimitFaturacao());
        fatura.setDtVencimentoFatura(dto.getDtVencimentoFatura());
        fatura.setEstado("RASCUNHO");
        fatura.setPago(false);
        fatura.setFornecedor(fornecedor);
        fatura.setPrSerie(serie);
        fatura.setTermCondicoes(dto.getTermCondicoes());
        fatura.setNota(dto.getNota());
        fatura.setUtilizador("system");
        fatura.setDescontoFinanceiro(BigDecimal.ZERO);
        fatura.setDescontoComercial(BigDecimal.ZERO);
        fatura.setValorIliquido(BigDecimal.ZERO);
        fatura.setValorImposto(BigDecimal.ZERO);
        fatura.setValorFatura(BigDecimal.ZERO);
        fatura.setValorPago(BigDecimal.ZERO);
        fatura.setValorPorPagar(BigDecimal.ZERO);
        fatura.setItems(new ArrayList<>());

        BigDecimal totalIliquido = BigDecimal.ZERO;
        BigDecimal totalImposto = BigDecimal.ZERO;

        for (FaturaCompraItemDTO itemDto : dto.getItems()) {
            FaturaCompraItemEntity item = new FaturaCompraItemEntity();
            item.setFaturaCompra(fatura);
            item.setNumLinha(itemDto.getNumLinha());
            item.setDesig(itemDto.getDesig());
            item.setDescr(itemDto.getDescr());
            item.setQuantidade(itemDto.getQuantidade());
            item.setPrecoUnitario(itemDto.getPrecoUnitario());
            item.setCodigoArtigo(itemDto.getCodigoArtigo());
            item.setEstado("ATIVO");

            if (itemDto.getProdutoId() != null) {
                produtoRepo.findById(itemDto.getProdutoId()).ifPresent(item::setProduto);
            }
            if (itemDto.getPrUnidadeId() != null) {
                unidadeRepo.findById(itemDto.getPrUnidadeId()).ifPresent(item::setPrUnidade);
            }
            if (itemDto.getContaGlId() != null) {
                item.setContaGlId(itemDto.getContaGlId());
            }

            // Calculate values
            BigDecimal valorBruto = itemDto.getQuantidade().multiply(itemDto.getPrecoUnitario()).setScale(4, RoundingMode.HALF_UP);
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

            // Process taxes
            BigDecimal itemTotalImposto = BigDecimal.ZERO;
            item.setImpostos(new ArrayList<>());

            if (itemDto.getImpostos() != null) {
                for (FaturaCompraItemImpostoDTO impostoDto : itemDto.getImpostos()) {
                    PrImpostoEntity imposto = impostoRepo.findById(impostoDto.getImpostoId())
                            .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Imposto não encontrado: " + impostoDto.getImpostoId()));

                    FaturaCompraItemImpostoEntity itemImposto = new FaturaCompraItemImpostoEntity();
                    itemImposto.setFaturaCompraItem(item);
                    itemImposto.setImposto(imposto);
                    itemImposto.setTipoCalculo(impostoDto.getTipoCalculo());
                    itemImposto.setBaseCalculo(impostoDto.getBaseCalculo());
                    itemImposto.setValorImposto(impostoDto.getValorImposto());
                    itemImposto.setTaxa(impostoDto.getTaxa());
                    itemImposto.setValorFixo(impostoDto.getValorFixo());
                    itemImposto.setMotivoNaoAplicarImposto(impostoDto.getMotivoNaoAplicarImposto());
                    itemImposto.setContaGlId(impostoDto.getContaGlId());
                    itemImposto.setOrdem(impostoDto.getOrdem());

                    item.getImpostos().add(itemImposto);
                    itemTotalImposto = itemTotalImposto.add(impostoDto.getValorImposto());
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
        return ResponseEntity.ok(saved);
    }
}
