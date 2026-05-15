package cv.igrp.fatura.venda.application.commands;

import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConfirmarFaturaVendaCommandHandlerTest {

    @Mock
    FaturaVendaRepository faturaVendaRepo;

    @InjectMocks
    ConfirmarFaturaVendaCommandHandler handler;

    @Test
    void handle_transitionsRascunhoToConfirmado() {
        FaturaVendaEntity fatura = new FaturaVendaEntity();
        fatura.setId(1);
        fatura.setCodigo("FVENDA-001");
        fatura.setEstado("RASCUNHO");

        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<FaturaVendaEntity> result = handler.handle(new ConfirmarFaturaVendaCommand(1));

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        FaturaVendaEntity saved = result.getBody();
        assertThat(saved).isNotNull();
        assertThat(saved.getEstado()).isEqualTo("CONFIRMADO");
    }

    @Test
    void handle_setsDtConfirmacaoToToday() {
        FaturaVendaEntity fatura = new FaturaVendaEntity();
        fatura.setId(1);
        fatura.setCodigo("FVENDA-001");
        fatura.setEstado("RASCUNHO");

        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        handler.handle(new ConfirmarFaturaVendaCommand(1));

        assertThat(fatura.getDtConfirmacao()).isEqualTo(LocalDate.now());
    }

    @Test
    void handle_preservesCodigoDuringConfirmation() {
        FaturaVendaEntity fatura = new FaturaVendaEntity();
        fatura.setId(1);
        fatura.setCodigo("FVENDA-042");
        fatura.setEstado("RASCUNHO");

        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<FaturaVendaEntity> result = handler.handle(new ConfirmarFaturaVendaCommand(1));

        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getCodigo()).isEqualTo("FVENDA-042");
        verify(faturaVendaRepo).save(fatura);
    }

    @Test
    void handle_throwsUnprocessableEntity_whenAlreadyConfirmado() {
        FaturaVendaEntity fatura = new FaturaVendaEntity();
        fatura.setId(2);
        fatura.setCodigo("FVENDA-002");
        fatura.setEstado("CONFIRMADO");

        when(faturaVendaRepo.findById(2)).thenReturn(Optional.of(fatura));

        assertThatThrownBy(() -> handler.handle(new ConfirmarFaturaVendaCommand(2)))
                .isInstanceOf(IgrpResponseStatusException.class)
                .satisfies(ex -> assertThat(
                        ((IgrpResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));
    }

    @Test
    void handle_throwsNotFound_whenFaturaDoesNotExist() {
        when(faturaVendaRepo.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(new ConfirmarFaturaVendaCommand(99)))
                .isInstanceOf(IgrpResponseStatusException.class)
                .satisfies(ex -> assertThat(
                        ((IgrpResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }
}
