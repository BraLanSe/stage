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

    /** KPI 1 — Soma do valorIliquido de todas as faturas CONFIRMADO */
    private BigDecimal valorIliquido;

    /** KPI 2 — Soma do valorImposto de todas as faturas CONFIRMADO */
    private BigDecimal valorImposto;

    /** KPI 3 — Soma do valorFatura (total c/ impostos) de todas as faturas CONFIRMADO */
    private BigDecimal valorTotal;

    /** Summary Strip — vendas confirmadas do mês corrente */
    private BigDecimal totalVendas;

    /** Summary Strip — variação percentual vs mês anterior (pode ser negativo) */
    private BigDecimal variacaoVendas;

    /** Summary Strip — total de clientes cadastrados */
    private Long totalClientes;

    /** Summary Strip — total de faturas confirmadas (todos os tempos) */
    private Long totalFaturas;

    /** Summary Strip — montante total por pagar (faturas CONFIRMADO não pagas) */
    private BigDecimal totalValorPorPagar;
}
