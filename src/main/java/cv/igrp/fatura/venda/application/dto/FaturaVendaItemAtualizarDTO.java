package cv.igrp.fatura.venda.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@IgrpDTO
public class FaturaVendaItemAtualizarDTO {
    private String desig;
    private String descr;
    private BigDecimal quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal descontoComercialPerc;
    private BigDecimal percentagemIva;
    private String unidade;
    private Integer produtoId;
    private String codigoArtigo;
}
