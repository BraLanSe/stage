package cv.igrp.fatura.parametrizacao.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class PrSerieDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    private String desig;

    private Integer prFaturaTipoId;

    private Integer contador;

    private String estado;
}
