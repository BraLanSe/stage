package cv.igrp.fatura.parametrizacao.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class PrEnquadramentoDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    @NotBlank
    private String desig;

    private String descr;

    private String estado;
}
