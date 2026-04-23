package cv.igrp.fatura.dashboard;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class DashboardStatsDTO {

    // ── Venda KPIs ────────────────────────────────────────────────────────────
    private BigDecimal valorIliquido;
    private BigDecimal valorImposto;
    private BigDecimal valorTotal;

    // ── Summary Strip — vendas ────────────────────────────────────────────────
    private BigDecimal totalVendas;
    private BigDecimal variacaoVendas;
    private Long totalClientes;
    private Long totalFaturas;
    private BigDecimal totalValorPorPagar;

    // ── Compra KPIs ───────────────────────────────────────────────────────────
    private BigDecimal totalCompras;
    private BigDecimal variacaoCompras;
    private Long totalFaturasFornecedor;
    private BigDecimal totalValorPorPagarCompras;
}
