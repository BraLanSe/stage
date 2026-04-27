package cv.igrp.fatura.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendasMensaisDTO {
    private String mes;
    private BigDecimal vendas;
    private BigDecimal compras;
}
