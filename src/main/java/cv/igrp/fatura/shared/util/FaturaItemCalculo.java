package cv.igrp.fatura.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class FaturaItemCalculo {

    private FaturaItemCalculo() {}

    public record Resultado(
        BigDecimal valorBruto,
        BigDecimal descontoComercialValor,
        BigDecimal valorLiquido,
        BigDecimal valorImposto,
        BigDecimal valorTotal
    ) {}

    /**
     * Calculates line-item monetary values from TTC (tax-inclusive) unit price.
     * IVA is applied to valorLiquido (after discount), consistent with the create handler.
     */
    public static Resultado calcular(
            BigDecimal quantidade,
            BigDecimal precoUnitario,
            BigDecimal descontoComercialPerc,
            BigDecimal percentagemIva) {

        BigDecimal qty    = nvl(quantidade, BigDecimal.ONE);
        BigDecimal preco  = nvl(precoUnitario, BigDecimal.ZERO);
        BigDecimal desc   = nvl(descontoComercialPerc, BigDecimal.ZERO);
        BigDecimal iva    = nvl(percentagemIva, BigDecimal.ZERO);

        BigDecimal bruto    = qty.multiply(preco).setScale(4, RoundingMode.HALF_UP);
        BigDecimal descVal  = bruto.multiply(desc)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal liquido  = bruto.subtract(descVal).setScale(4, RoundingMode.HALF_UP);
        BigDecimal imposto  = liquido.multiply(iva)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal total    = liquido.add(imposto).setScale(4, RoundingMode.HALF_UP);

        return new Resultado(bruto, descVal, liquido, imposto, total);
    }

    private static BigDecimal nvl(BigDecimal v, BigDecimal def) {
        return v != null ? v : def;
    }
}
