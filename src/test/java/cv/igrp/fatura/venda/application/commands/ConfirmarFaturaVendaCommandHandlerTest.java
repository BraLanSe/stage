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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfirmarFaturaVendaCommandHandlerTest {

    @Mock FaturaVendaRepository faturaVendaRepo;
    @InjectMocks ConfirmarFaturaVendaCommandHandler handler;

    private FaturaVendaEntity faturaRascunho(Integer id, String codigo) {
        FaturaVendaEntity f = new FaturaVendaEntity();
        f.setId(id);
        f.setCodigo(codigo);
        f.setEstado("RASCUNHO");
        f.setPago(false);
        f.setValorFatura(new BigDecimal("500.00"));
        f.setValorPorPagar(new BigDecimal("500.00"));
        f.setValorPago(BigDecimal.ZERO);
        return f;
    }

    @Test
    void shouldTransitionStateFromRascunhoToConfirmado() {
        FaturaVendaEntity fatura = faturaRascunho(1, "FV-1");
        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<FaturaVendaEntity> response = handler.handle(new ConfirmarFaturaVendaCommand(1));

        assertAll(
                () -> assertEquals(HttpStatus.OK, response.getStatusCode()),
                () -> assertEquals("CONFIRMADO", response.getBody().getEstado())
        );
    }

    @Test
    void shouldSetDtConfirmacaoToToday() {
        FaturaVendaEntity fatura = faturaRascunho(1, "FV-1");
        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        handler.handle(new ConfirmarFaturaVendaCommand(1));

        assertEquals(LocalDate.now(), fatura.getDtConfirmacao());
    }

    @Test
    void shouldPreserveCodigoAndFinancialAmountsAfterConfirmation() {
        FaturaVendaEntity fatura = faturaRascunho(7, "FT-007");
        when(faturaVendaRepo.findById(7)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FaturaVendaEntity confirmed = handler.handle(new ConfirmarFaturaVendaCommand(7)).getBody();

        assertAll(
                () -> assertEquals("FT-007", confirmed.getCodigo()),
                () -> assertEquals(new BigDecimal("500.00"), confirmed.getValorFatura()),
                () -> assertEquals("CONFIRMADO", confirmed.getEstado())
        );
    }

    @Test
    void shouldPersistViaRepositorySave() {
        FaturaVendaEntity fatura = faturaRascunho(1, "FV-1");
        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaVendaRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        handler.handle(new ConfirmarFaturaVendaCommand(1));

        verify(faturaVendaRepo, times(1)).save(fatura);
    }

    @Test
    void shouldThrowNotFoundWhenFaturaDoesNotExist() {
        when(faturaVendaRepo.findById(404)).thenReturn(Optional.empty());

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new ConfirmarFaturaVendaCommand(404)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldThrowUnprocessableWhenFaturaAlreadyConfirmada() {
        FaturaVendaEntity fatura = faturaRascunho(1, "FV-1");
        fatura.setEstado("CONFIRMADO");
        when(faturaVendaRepo.findById(1)).thenReturn(Optional.of(fatura));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new ConfirmarFaturaVendaCommand(1)));

        assertAll(
                () -> assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode()),
                () -> verify(faturaVendaRepo, never()).save(any())
        );
    }

    @Test
    void shouldThrowUnprocessableWhenFaturaAlreadyAnulada() {
        FaturaVendaEntity fatura = faturaRascunho(2, "FV-2");
        fatura.setEstado("ANULADO");
        when(faturaVendaRepo.findById(2)).thenReturn(Optional.of(fatura));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new ConfirmarFaturaVendaCommand(2)));

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    }
}
