package cv.igrp.fatura.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private long totalClientes;
    private long totalFornecedores;
    private long totalProdutos;

    @Builder.Default
    private BigDecimal totalVendas = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal totalDespesas = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal ganhoLucro = BigDecimal.ZERO;

    @Builder.Default
    private double variacaoVendas = 0.0;

    @Builder.Default
    private double variacaoDespesas = 0.0;

    @Builder.Default
    private double variacaoLucro = 0.0;

    private List<VendasMensaisDTO> vendasMensais;

    /** Reuses the frontend vendasPorMeio slot to display invoice estado breakdown. */
    private List<VendasPorMeioDTO> vendasPorMeio;

    private List<TopProdutoDTO> topProdutos;

    private List<TopClienteDTO> topClientes;
}
