package cv.igrp.fatura.pagamento.application.commands;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.pagamento.application.dto.PagamentoCreateDTO;
import cv.igrp.fatura.pagamento.application.dto.PagamentoDocumentoDTO;
import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoDocumentoEntity;
import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoEntity;
import cv.igrp.fatura.pagamento.infrastructure.persistence.repository.PagamentoDocumentoRepository;
import cv.igrp.fatura.pagamento.infrastructure.persistence.repository.PagamentoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrMetodoPagamentoRepository;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import cv.igrp.framework.core.domain.CommandHandler;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CreatePagamentoCommandHandler implements CommandHandler<CreatePagamentoCommand, ResponseEntity<PagamentoEntity>> {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreatePagamentoCommandHandler.class);

    private final PagamentoRepository pagamentoRepo;
    private final PagamentoDocumentoRepository pagamentoDocumentoRepo;
    private final PrMetodoPagamentoRepository metodoPagamentoRepo;
    private final FaturaVendaRepository faturaVendaRepo;
    private final FaturaCompraRepository faturaCompraRepo;

    @Override
    @Transactional
    public ResponseEntity<PagamentoEntity> handle(CreatePagamentoCommand command) {
        PagamentoCreateDTO dto = command.getDto();

        var tipoPagamento = metodoPagamentoRepo.findById(dto.getTipoPagamentoId())
                .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "Método de pagamento não encontrado: " + dto.getTipoPagamentoId()));

        PagamentoEntity entity = new PagamentoEntity();
        entity.setCodigo(dto.getCodigo());
        entity.setBanco(dto.getBanco());
        entity.setValorPagamento(dto.getValorPagamento());
        entity.setNumDocumento(dto.getNumDocumento());
        entity.setTipoPagamento(tipoPagamento);
        entity.setAgenciaId(dto.getAgenciaId());
        entity.setAnexoComprovativo(dto.getAnexoComprovativo());
        entity.setNota(dto.getNota());
        entity.setDtPagamento(dto.getDtPagamento());
        entity.setUtilizador(dto.getUtilizador());
        entity.setCodigoReferencia(dto.getCodigoReferencia());
        if (dto.getEstado() != null) entity.setEstado(dto.getEstado());

        PagamentoEntity saved = pagamentoRepo.save(entity);

        // Application du paiement aux documents (spec RF-09, §8.10-8.11)
        if (dto.getDocumentos() != null) {
            BigDecimal totalAplicado = dto.getDocumentos().stream()
                    .map(PagamentoDocumentoDTO::getValorAplicado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalAplicado.compareTo(dto.getValorPagamento()) > 0) {
                throw IgrpResponseStatusException.of(HttpStatus.BAD_REQUEST,
                        "Total aplicado (" + totalAplicado + ") superior ao valor do pagamento (" + dto.getValorPagamento() + ")");
            }

            for (PagamentoDocumentoDTO docDto : dto.getDocumentos()) {
                PagamentoDocumentoEntity docEntity = new PagamentoDocumentoEntity();
                docEntity.setPagamento(saved);
                docEntity.setValorAplicado(docDto.getValorAplicado());
                docEntity.setDescontoFinanceiroAplicado(docDto.getDescontoFinanceiroAplicado());
                docEntity.setRegularizacaoRefCod(docDto.getRegularizacaoRefCod());
                docEntity.setDtRegisto(LocalDateTime.now());

                if (docDto.getFaturaVendaId() != null) {
                    docEntity.setFaturaVendaId(docDto.getFaturaVendaId());
                    FaturaVendaEntity fv = faturaVendaRepo.findById(docDto.getFaturaVendaId())
                            .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "FaturaVenda não encontrada: " + docDto.getFaturaVendaId()));

                    BigDecimal novoValorPago = fv.getValorPago().add(docDto.getValorAplicado());
                    BigDecimal novoValorPorPagar = fv.getValorPorPagar().subtract(docDto.getValorAplicado());
                    if (novoValorPorPagar.compareTo(BigDecimal.ZERO) < 0) {
                        throw IgrpResponseStatusException.of(HttpStatus.BAD_REQUEST,
                                "Valor aplicado excede o saldo da FaturaVenda " + docDto.getFaturaVendaId());
                    }
                    fv.setValorPago(novoValorPago);
                    fv.setValorPorPagar(novoValorPorPagar);
                    fv.setPago(novoValorPorPagar.compareTo(BigDecimal.ZERO) == 0);
                    faturaVendaRepo.save(fv);
                }

                if (docDto.getFaturaCompraId() != null) {
                    docEntity.setFaturaCompraId(docDto.getFaturaCompraId());
                    FaturaCompraEntity fc = faturaCompraRepo.findById(docDto.getFaturaCompraId())
                            .orElseThrow(() -> IgrpResponseStatusException.of(HttpStatus.NOT_FOUND, "FaturaCompra não encontrada: " + docDto.getFaturaCompraId()));

                    BigDecimal novoValorPago = fc.getValorPago().add(docDto.getValorAplicado());
                    BigDecimal novoValorPorPagar = fc.getValorPorPagar().subtract(docDto.getValorAplicado());
                    if (novoValorPorPagar.compareTo(BigDecimal.ZERO) < 0) {
                        throw IgrpResponseStatusException.of(HttpStatus.BAD_REQUEST,
                                "Valor aplicado excede o saldo da FaturaCompra " + docDto.getFaturaCompraId());
                    }
                    fc.setValorPago(novoValorPago);
                    fc.setValorPorPagar(novoValorPorPagar);
                    fc.setPago(novoValorPorPagar.compareTo(BigDecimal.ZERO) == 0);
                    faturaCompraRepo.save(fc);
                }

                pagamentoDocumentoRepo.save(docEntity);
            }
        }

        LOGGER.info("Pagamento criado com ID: {}", saved.getId());
        return ResponseEntity.ok(saved);
    }
}
