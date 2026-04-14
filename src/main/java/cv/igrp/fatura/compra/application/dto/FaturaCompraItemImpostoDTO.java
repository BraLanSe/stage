package cv.igrp.fatura.compra.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class FaturaCompraItemImpostoDTO {

    @NotNull
    private Integer impostoId;

    @NotBlank
    private String tipoCalculo; // PERCENTAGEM or VALOR_FIXO

    private BigDecimal taxa;

    private BigDecimal valorFixo;

    @NotNull
    private BigDecimal baseCalculo;

    @NotNull
    private BigDecimal valorImposto;

    private String motivoNaoAplicarImposto;

    private Integer contaGlId;

    private Integer ordem;
}
