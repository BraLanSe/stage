package cv.igrp.fatura.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class FaturaItemCalculo {

    private FaturaItemCalculo() {}

    public record Resultado(
        BigDecimal valorBruto,
        BigDecimal descontoComercialValor,
        BigDecimal descontoFinanceiroValor,
        BigDecimal valorLiquido,
        BigDecimal valorImposto,
        BigDecimal valorTotal
    ) {}

    public static Resultado calcular(
            BigDecimal quantidade,
            BigDecimal precoUnitario,
            BigDecimal descontoComercialPerc,
            BigDecimal percentagemIva) {
        return calcular(quantidade, precoUnitario, descontoComercialPerc, null, percentagemIva);
    }

    /**
     * Full calculation with both commercial and financial discounts.
     * Financial discount is applied after commercial discount, on the remaining base.
     */
    public static Resultado calcular(
            BigDecimal quantidade,
            BigDecimal precoUnitario,
            BigDecimal descontoComercialPerc,
            BigDecimal descontoFinanceiroPerc,
            BigDecimal percentagemIva) {

        BigDecimal qty    = nvl(quantidade, BigDecimal.ONE);
        BigDecimal preco  = nvl(precoUnitario, BigDecimal.ZERO);
        BigDecimal descC  = nvl(descontoComercialPerc, BigDecimal.ZERO);
        BigDecimal descF  = nvl(descontoFinanceiroPerc, BigDecimal.ZERO);
        BigDecimal iva    = nvl(percentagemIva, BigDecimal.ZERO);

        BigDecimal bruto       = qty.multiply(preco).setScale(4, RoundingMode.HALF_UP);
        BigDecimal descCVal    = bruto.multiply(descC)
                                      .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal afterComercial = bruto.subtract(descCVal);
        BigDecimal descFVal    = afterComercial.multiply(descF)
                                               .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal liquido     = afterComercial.subtract(descFVal).setScale(4, RoundingMode.HALF_UP);
        BigDecimal imposto     = liquido.multiply(iva)
                                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal total       = liquido.add(imposto).setScale(4, RoundingMode.HALF_UP);

        return new Resultado(bruto, descCVal, descFVal, liquido, imposto, total);
    }

    private static BigDecimal nvl(BigDecimal v, BigDecimal def) {
        return v != null ? v : def;
    }
}
