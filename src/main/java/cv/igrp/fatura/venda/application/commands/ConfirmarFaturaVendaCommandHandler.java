package cv.igrp.fatura.venda.application.commands;

import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import cv.igrp.framework.core.domain.CommandHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ConfirmarFaturaVendaCommandHandler implements CommandHandler<ConfirmarFaturaVendaCommand, ResponseEntity<FaturaVendaEntity>> {

    private final FaturaVendaRepository faturaVendaRepo;

    @Override
    @Transactional
    public ResponseEntity<FaturaVendaEntity> handle(ConfirmarFaturaVendaCommand command) {
        FaturaVendaEntity fatura = faturaVendaRepo.findById(command.getFaturaId())
                .orElseThrow(() -> IgrpResponseStatusException.of(
                        HttpStatus.NOT_FOUND, "Fatura de venda não encontrada: " + command.getFaturaId()));

        if (!"RASCUNHO".equals(fatura.getEstado())) {
            throw IgrpResponseStatusException.of(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Apenas faturas em estado RASCUNHO podem ser confirmadas. Estado atual: " + fatura.getEstado());
        }

        fatura.setEstado("CONFIRMADO");
        fatura.setDtConfirmacao(LocalDate.now());

        return ResponseEntity.ok(faturaVendaRepo.save(fatura));
    }
}
