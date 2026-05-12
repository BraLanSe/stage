package cv.igrp.fatura.compra.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class FaturaCompraItemDTO {

    @NotNull
    private Integer numLinha;

    private Integer produtoId;

    private String codigoArtigo;

    // Optionnel si produtoId est fourni — le handler copie depuis le produit
    private String desig;

    private String descr;

    @NotNull
    private BigDecimal quantidade;

    private Integer prUnidadeId;

    // Optionnel si produtoId est fourni — le handler copie depuis le produit
    private BigDecimal precoUnitario;

    private BigDecimal descontoComercialPerc;

    private BigDecimal descontoFinanceiroPerc;

    private Integer contaGlId;

    private List<FaturaCompraItemImpostoDTO> impostos = new ArrayList<>();
}
