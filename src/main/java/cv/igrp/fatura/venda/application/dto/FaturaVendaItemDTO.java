package cv.igrp.fatura.venda.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class FaturaVendaItemDTO {

    @NotNull
    private Integer numLinha;

    private Integer produtoId;

    private String codigoArtigo;

    @NotBlank
    private String desig;

    private String descr;

    @NotNull
    private BigDecimal quantidade;

    private Integer prUnidadeId;

    @NotNull
    private BigDecimal precoUnitario;

    private BigDecimal descontoComercialPerc;

    private BigDecimal descontoFinanceiroPerc;

    private Integer contaGlId;

    private List<FaturaVendaItemImpostoDTO> impostos = new ArrayList<>();
}
