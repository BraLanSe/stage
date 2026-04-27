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
public class TopProdutoDTO {
    private String desig;
    private String codigoArtigo;
    private BigDecimal totalQuantidade;
    private BigDecimal totalValor;
}
