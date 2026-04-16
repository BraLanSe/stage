package cv.igrp.fatura.dashboard;

import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import cv.igrp.framework.stereotype.IgrpController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@IgrpController
@RestController
@RequestMapping(value = "api/v1/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Estatísticas globais de faturação")
public class DashboardController {

    private final FaturaVendaRepository faturaVendaRepo;
    private final ClienteRepository clienteRepo;

    @GetMapping("/stats")
    @Operation(summary = "Obter estatísticas do dashboard (KPIs + Summary Strip)")
    public ResponseEntity<DashboardStatsDTO> getStats() {

        // KPI totals — all-time confirmed invoices
        BigDecimal valorIliquido = faturaVendaRepo.sumValorIliquido();
        BigDecimal valorImposto  = faturaVendaRepo.sumValorImposto();
        BigDecimal valorTotal    = faturaVendaRepo.sumValorFatura();

        // Monthly comparison for Summary Strip
        LocalDate hoje            = LocalDate.now();
        LocalDate inicioMesAtual  = hoje.withDayOfMonth(1);
        LocalDate inicioMesAnterior = inicioMesAtual.minusMonths(1);

        BigDecimal vendasMesAtual   = faturaVendaRepo.sumValorFaturaBetween(inicioMesAtual, inicioMesAtual.plusMonths(1));
        BigDecimal vendasMesAnterior = faturaVendaRepo.sumValorFaturaBetween(inicioMesAnterior, inicioMesAtual);

        BigDecimal variacaoVendas;
        if (vendasMesAnterior.compareTo(BigDecimal.ZERO) == 0) {
            variacaoVendas = vendasMesAtual.compareTo(BigDecimal.ZERO) > 0
                    ? new BigDecimal("100.00")
                    : BigDecimal.ZERO;
        } else {
            variacaoVendas = vendasMesAtual.subtract(vendasMesAnterior)
                    .divide(vendasMesAnterior, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        Long totalFaturas      = faturaVendaRepo.countConfirmado();
        Long totalClientes     = clienteRepo.count();
        BigDecimal totalValorPorPagar = faturaVendaRepo.sumValorPorPagar();

        return ResponseEntity.ok(new DashboardStatsDTO(
                valorIliquido,
                valorImposto,
                valorTotal,
                vendasMesAtual,
                variacaoVendas,
                totalClientes,
                totalFaturas,
                totalValorPorPagar
        ));
    }
}
