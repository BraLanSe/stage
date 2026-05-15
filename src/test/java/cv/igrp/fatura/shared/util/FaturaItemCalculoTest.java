package cv.igrp.fatura.shared.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class FaturaItemCalculoTest {

    @Test
    void calcular_noDiscount_computesCorrectly() {
        // 2 units × 100.00, 0% discount, 20% IVA
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                new BigDecimal("2"),
                new BigDecimal("100.00"),
                BigDecimal.ZERO,
                new BigDecimal("20")
        );

        assertThat(r.valorBruto()).isEqualByComparingTo("200.0000");
        assertThat(r.descontoComercialValor()).isEqualByComparingTo("0.0000");
        assertThat(r.valorLiquido()).isEqualByComparingTo("200.0000");
        assertThat(r.valorImposto()).isEqualByComparingTo("40.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo("240.0000");
    }

    @Test
    void calcular_withCommercialDiscount_reducesBase() {
        // 1 unit × 200.00, 10% commercial discount, 20% IVA
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                BigDecimal.ONE,
                new BigDecimal("200.00"),
                new BigDecimal("10"),
                new BigDecimal("20")
        );

        assertThat(r.valorBruto()).isEqualByComparingTo("200.0000");
        assertThat(r.descontoComercialValor()).isEqualByComparingTo("20.0000");
        assertThat(r.valorLiquido()).isEqualByComparingTo("180.0000");
        assertThat(r.valorImposto()).isEqualByComparingTo("36.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo("216.0000");
    }

    @Test
    void calcular_withFinancialDiscount_appliedAfterCommercial() {
        // 1 unit × 1000.00, 10% commercial, 5% financial, 20% IVA
        // bruto = 1000, descC = 100, afterComercial = 900, descF = 45, liquido = 855, IVA = 171, total = 1026
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                BigDecimal.ONE,
                new BigDecimal("1000.00"),
                new BigDecimal("10"),
                new BigDecimal("5"),
                new BigDecimal("20")
        );

        assertThat(r.valorBruto()).isEqualByComparingTo("1000.0000");
        assertThat(r.descontoComercialValor()).isEqualByComparingTo("100.0000");
        assertThat(r.descontoFinanceiroValor()).isEqualByComparingTo("45.0000");
        assertThat(r.valorLiquido()).isEqualByComparingTo("855.0000");
        assertThat(r.valorImposto()).isEqualByComparingTo("171.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo("1026.0000");
    }

    @Test
    void calcular_hundredPercentCommercialDiscount_yieldsZeroTotal() {
        // 100% commercial discount → net and total should be zero
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                BigDecimal.ONE,
                new BigDecimal("500.00"),
                new BigDecimal("100"),
                new BigDecimal("20")
        );

        assertThat(r.descontoComercialValor()).isEqualByComparingTo("500.0000");
        assertThat(r.valorLiquido()).isEqualByComparingTo("0.0000");
        assertThat(r.valorImposto()).isEqualByComparingTo("0.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo("0.0000");
    }

    @Test
    void calcular_hundredPercentFinancialDiscount_yieldsZeroNet() {
        // 0% commercial, 100% financial → net = 0
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                BigDecimal.ONE,
                new BigDecimal("300.00"),
                BigDecimal.ZERO,
                new BigDecimal("100"),
                new BigDecimal("20")
        );

        assertThat(r.descontoFinanceiroValor()).isEqualByComparingTo("300.0000");
        assertThat(r.valorLiquido()).isEqualByComparingTo("0.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo("0.0000");
    }

    @Test
    void calcular_nullDiscounts_treatedAsZero() {
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                new BigDecimal("3"),
                new BigDecimal("50.00"),
                null,
                null,
                new BigDecimal("15")
        );

        assertThat(r.valorBruto()).isEqualByComparingTo("150.0000");
        assertThat(r.descontoComercialValor()).isEqualByComparingTo("0.0000");
        assertThat(r.descontoFinanceiroValor()).isEqualByComparingTo("0.0000");
        assertThat(r.valorLiquido()).isEqualByComparingTo("150.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo("172.5000");
    }

    @Test
    void calcular_zeroIva_totalEqualsLiquido() {
        FaturaItemCalculo.Resultado r = FaturaItemCalculo.calcular(
                new BigDecimal("5"),
                new BigDecimal("20.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );

        assertThat(r.valorImposto()).isEqualByComparingTo("0.0000");
        assertThat(r.valorTotal()).isEqualByComparingTo(r.valorLiquido());
    }
}
