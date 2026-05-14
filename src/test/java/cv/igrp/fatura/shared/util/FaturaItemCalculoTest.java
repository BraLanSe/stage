package cv.igrp.fatura.shared.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FaturaItemCalculoTest {

    @Test
    void shouldCalculateSimpleTotalWithoutDiscount() {
        var r = FaturaItemCalculo.calcular(
                bd("2"), bd("100.00"), null, bd("15"));

        assertAll(
                () -> assertEquals(bd("200.0000"), r.valorBruto()),
                () -> assertEquals(BigDecimal.ZERO.setScale(4), r.descontoComercialValor().setScale(4)),
                () -> assertEquals(bd("200.0000"), r.valorLiquido()),
                () -> assertEquals(bd("30.0000"), r.valorImposto()),
                () -> assertEquals(bd("230.0000"), r.valorTotal())
        );
    }

    @Test
    void shouldCalculateTotalWithCommercialDiscountCorrectly() {
        var r = FaturaItemCalculo.calcular(
                bd("1"), bd("1000.00"), bd("10"), bd("0"));

        assertAll(
                () -> assertEquals(bd("1000.0000"), r.valorBruto()),
                () -> assertEquals(bd("100.0000"), r.descontoComercialValor()),
                () -> assertEquals(bd("900.0000"), r.valorLiquido()),
                () -> assertEquals(bd("0.0000"), r.valorImposto()),
                () -> assertEquals(bd("900.0000"), r.valorTotal())
        );
    }

    @Test
    void shouldApplyFinancialDiscountAfterCommercialDiscount() {
        // bruto = 1000, descC 10% = 100 → afterC = 900, descF 5% = 45 → liquido = 855
        var r = FaturaItemCalculo.calcular(
                bd("1"), bd("1000.00"), bd("10"), bd("5"), bd("0"));

        assertAll(
                () -> assertEquals(bd("1000.0000"), r.valorBruto()),
                () -> assertEquals(bd("100.0000"), r.descontoComercialValor()),
                () -> assertEquals(bd("45.0000"), r.descontoFinanceiroValor()),
                () -> assertEquals(bd("855.0000"), r.valorLiquido()),
                () -> assertEquals(bd("0.0000"), r.valorImposto()),
                () -> assertEquals(bd("855.0000"), r.valorTotal())
        );
    }

    @Test
    void shouldCalculateTotalWithBothDiscountsAndIva() {
        // bruto=500, descC 20%=100 → afterC=400, descF 5%=20 → liquido=380, IVA 15%=57 → total=437
        var r = FaturaItemCalculo.calcular(
                bd("1"), bd("500.00"), bd("20"), bd("5"), bd("15"));

        assertAll(
                () -> assertEquals(bd("500.0000"), r.valorBruto()),
                () -> assertEquals(bd("100.0000"), r.descontoComercialValor()),
                () -> assertEquals(bd("20.0000"), r.descontoFinanceiroValor()),
                () -> assertEquals(bd("380.0000"), r.valorLiquido()),
                () -> assertEquals(bd("57.0000"), r.valorImposto()),
                () -> assertEquals(bd("437.0000"), r.valorTotal())
        );
    }

    @Test
    void shouldHandleNullInputsAsZeroOrOne() {
        // null qty → 1, null price → 0 → all zeros
        var r = FaturaItemCalculo.calcular(null, null, null, null);

        assertAll(
                () -> assertEquals(BigDecimal.ZERO.setScale(4), r.valorBruto().setScale(4)),
                () -> assertEquals(BigDecimal.ZERO.setScale(4), r.valorTotal().setScale(4))
        );
    }

    @Test
    void shouldCalculateWithMultipleQuantity() {
        // qty=3, price=200, IVA=20% → bruto=600, imposto=120, total=720
        var r = FaturaItemCalculo.calcular(
                bd("3"), bd("200.00"), null, bd("20"));

        assertAll(
                () -> assertEquals(bd("600.0000"), r.valorBruto()),
                () -> assertEquals(bd("120.0000"), r.valorImposto()),
                () -> assertEquals(bd("720.0000"), r.valorTotal())
        );
    }

    @Test
    void shouldReturnZeroDiscountsWhenNoneProvided() {
        var r = FaturaItemCalculo.calcular(bd("1"), bd("100"), bd("0"), bd("0"), bd("0"));

        assertAll(
                () -> assertEquals(0, r.descontoComercialValor().compareTo(BigDecimal.ZERO)),
                () -> assertEquals(0, r.descontoFinanceiroValor().compareTo(BigDecimal.ZERO))
        );
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
