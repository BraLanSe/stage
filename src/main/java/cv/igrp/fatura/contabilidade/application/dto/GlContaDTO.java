package cv.igrp.fatura.contabilidade.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class GlContaDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    @NotBlank
    private String desig;

    private String descr;

    @NotBlank
    private String tipoConta; // ATIVO, PASSIVO, CAPITAL, RENDIMENTO, GASTO

    private Integer contaPaiId;

    @NotNull
    private Boolean aceitaLancamento;

    private String estado;
}
