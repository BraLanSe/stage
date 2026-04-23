package cv.igrp.fatura.compra.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@IgrpDTO
public class FaturaCompraItemAtualizarDTO {
    private String desig;
    private String descr;
    private BigDecimal quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal percentagemIva;
}
