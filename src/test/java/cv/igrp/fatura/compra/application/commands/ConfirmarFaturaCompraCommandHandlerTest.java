package cv.igrp.fatura.compra.application.commands;

import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
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
class ConfirmarFaturaCompraCommandHandlerTest {

    @Mock FaturaCompraRepository faturaCompraRepo;
    @InjectMocks ConfirmarFaturaCompraCommandHandler handler;

    private FaturaCompraEntity faturaRascunho(Integer id, String codigo) {
        FaturaCompraEntity f = new FaturaCompraEntity();
        f.setId(id);
        f.setCodigo(codigo);
        f.setEstado("RASCUNHO");
        f.setPago(false);
        f.setValorFatura(new BigDecimal("1000.00"));
        f.setValorPorPagar(new BigDecimal("1000.00"));
        f.setValorPago(BigDecimal.ZERO);
        return f;
    }

    @Test
    void shouldTransitionStateFromRascunhoToConfirmado() {
        FaturaCompraEntity fatura = faturaRascunho(1, "FC-1");
        when(faturaCompraRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaCompraRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<FaturaCompraEntity> response = handler.handle(new ConfirmarFaturaCompraCommand(1));

        assertAll(
                () -> assertEquals(HttpStatus.OK, response.getStatusCode()),
                () -> assertEquals("CONFIRMADO", response.getBody().getEstado())
        );
    }

    @Test
    void shouldSetDtConfirmacaoToToday() {
        FaturaCompraEntity fatura = faturaRascunho(1, "FC-1");
        when(faturaCompraRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaCompraRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        handler.handle(new ConfirmarFaturaCompraCommand(1));

        assertEquals(LocalDate.now(), fatura.getDtConfirmacao());
    }

    @Test
    void shouldPreserveCodigoAfterConfirmation() {
        FaturaCompraEntity fatura = faturaRascunho(5, "FT-42");
        when(faturaCompraRepo.findById(5)).thenReturn(Optional.of(fatura));
        when(faturaCompraRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        FaturaCompraEntity confirmed = handler.handle(new ConfirmarFaturaCompraCommand(5)).getBody();

        assertAll(
                () -> assertEquals("FT-42", confirmed.getCodigo()),
                () -> assertEquals("CONFIRMADO", confirmed.getEstado())
        );
    }

    @Test
    void shouldPersistViaRepositorySave() {
        FaturaCompraEntity fatura = faturaRascunho(1, "FC-1");
        when(faturaCompraRepo.findById(1)).thenReturn(Optional.of(fatura));
        when(faturaCompraRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        handler.handle(new ConfirmarFaturaCompraCommand(1));

        verify(faturaCompraRepo, times(1)).save(fatura);
    }

    @Test
    void shouldThrowNotFoundWhenFaturaDoesNotExist() {
        when(faturaCompraRepo.findById(999)).thenReturn(Optional.empty());

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new ConfirmarFaturaCompraCommand(999)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldThrowUnprocessableWhenFaturaAlreadyConfirmada() {
        FaturaCompraEntity fatura = faturaRascunho(1, "FC-1");
        fatura.setEstado("CONFIRMADO");
        when(faturaCompraRepo.findById(1)).thenReturn(Optional.of(fatura));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new ConfirmarFaturaCompraCommand(1)));

        assertAll(
                () -> assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode()),
                () -> verify(faturaCompraRepo, never()).save(any())
        );
    }

    @Test
    void shouldThrowUnprocessableWhenFaturaAlreadyAnulada() {
        FaturaCompraEntity fatura = faturaRascunho(1, "FC-1");
        fatura.setEstado("ANULADO");
        when(faturaCompraRepo.findById(1)).thenReturn(Optional.of(fatura));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new ConfirmarFaturaCompraCommand(1)));

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    }
}
