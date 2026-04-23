package cv.igrp.fatura.compra.application.commands;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.framework.core.domain.CommandHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AnularFaturaCompraCommandHandler implements CommandHandler<AnularFaturaCompraCommand, ResponseEntity<FaturaCompraEntity>> {

    private final FaturaCompraRepository faturaCompraRepo;

    @Override
    @Transactional
    public ResponseEntity<FaturaCompraEntity> handle(AnularFaturaCompraCommand command) {
        FaturaCompraEntity fatura = faturaCompraRepo.findById(command.getFaturaId())
                .orElseThrow(() -> IgrpResponseStatusException.of(
                        HttpStatus.NOT_FOUND, "Fatura de compra não encontrada: " + command.getFaturaId()));

        if ("ANULADO".equals(fatura.getEstado())) {
            throw IgrpResponseStatusException.of(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Fatura já se encontra anulada.");
        }

        fatura.setEstado("ANULADO");
        return ResponseEntity.ok(faturaCompraRepo.save(fatura));
    }
}
