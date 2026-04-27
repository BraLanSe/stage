package cv.igrp.fatura.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProdutoDTO {
    private String desig;
    private BigDecimal totalVendido;
    private BigDecimal quantidade;
}
