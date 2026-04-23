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

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ConfirmarFaturaCompraCommandHandler implements CommandHandler<ConfirmarFaturaCompraCommand, ResponseEntity<FaturaCompraEntity>> {

    private final FaturaCompraRepository faturaCompraRepo;

    @Override
    @Transactional
    public ResponseEntity<FaturaCompraEntity> handle(ConfirmarFaturaCompraCommand command) {
        FaturaCompraEntity fatura = faturaCompraRepo.findById(command.getFaturaId())
                .orElseThrow(() -> IgrpResponseStatusException.of(
                        HttpStatus.NOT_FOUND, "Fatura de compra não encontrada: " + command.getFaturaId()));

        if (!"RASCUNHO".equals(fatura.getEstado())) {
            throw IgrpResponseStatusException.of(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Apenas faturas em estado RASCUNHO podem ser confirmadas. Estado atual: " + fatura.getEstado());
        }

        fatura.setEstado("CONFIRMADO");
        fatura.setDtConfirmacao(LocalDate.now());

        return ResponseEntity.ok(faturaCompraRepo.save(fatura));
    }
}
