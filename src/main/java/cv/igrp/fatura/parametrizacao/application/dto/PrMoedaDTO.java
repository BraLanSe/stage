package cv.igrp.fatura.parametrizacao.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class PrMoedaDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    @NotBlank
    private String desig;

    private String simbolo;

    private String estado;
}
