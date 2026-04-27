package cv.igrp.fatura.report;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class EstadoDistribuicaoDTO {
    private String estado;
    private Long count;
    private BigDecimal valorTotal;
}
