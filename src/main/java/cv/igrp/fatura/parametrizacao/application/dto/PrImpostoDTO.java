package cv.igrp.fatura.parametrizacao.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class PrImpostoDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    @NotBlank
    private String desig;

    private String descr;

    @NotBlank
    private String tipoCalculo; // PERCENTAGEM or VALOR_FIXO

    private BigDecimal valor;

    private Boolean aplicaRetencao;

    private Integer contaGlId;

    private String estado;
}
