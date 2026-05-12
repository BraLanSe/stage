package cv.igrp.fatura.dashboard;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@IgrpDTO
public class DashboardStatsDTO {

    // ── Entity counts ────────────────────────────────────────────
    private Long totalClientes;
    private Long totalFornecedores;
    private Long totalProdutos;

    // ── Current-month financials ─────────────────────────────────
    private BigDecimal totalVendas;
    private BigDecimal totalDespesas;
    private BigDecimal ganhoLucro;

    // ── Month-over-month variations (%) ─────────────────────────
    private BigDecimal variacaoVendas;
    private BigDecimal variacaoDespesas;
    private BigDecimal variacaoLucro;

    // ── All-time KPIs ────────────────────────────────────────────
    private BigDecimal valorIliquido;
    private BigDecimal valorImposto;
    private BigDecimal valorTotal;
    private Long totalFaturas;
    private BigDecimal totalValorPorPagar;
    private Long totalFaturasFornecedor;
    private BigDecimal totalValorPorPagarCompras;
}
