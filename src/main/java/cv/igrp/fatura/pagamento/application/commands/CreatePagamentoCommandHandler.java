package cv.igrp.fatura.pagamento.application.commands;

import cv.igrp.fatura.pagamento.application.dto.PagamentoCreateDTO;
import cv.igrp.fatura.pagamento.infrastructure.persistence.entity.PagamentoEntity;
import cv.igrp.fatura.pagamento.infrastructure.persistence.repository.PagamentoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrMetodoPagamentoRepository;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.framework.core.domain.CommandHandler;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CreatePagamentoCommandHandler implements CommandHandler<CreatePagamentoCommand, ResponseEntity<PagamentoEntity>> {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreatePagamentoCommandHandler.class);

    private final PagamentoRepository pagamentoRepo;
    private final PrMetodoPagamentoRepository metodoPagamentoRepo;

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
        LOGGER.info("Pagamento criado com ID: {}", saved.getId());
        return ResponseEntity.ok(saved);
    }
}
