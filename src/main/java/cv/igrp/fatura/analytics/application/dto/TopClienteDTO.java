package cv.igrp.fatura.analytics.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopClienteDTO {
    private String desig;
    private String nif;
    private BigDecimal totalFaturado;
}
