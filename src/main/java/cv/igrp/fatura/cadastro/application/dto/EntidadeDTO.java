package cv.igrp.fatura.cadastro.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class EntidadeDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    @NotBlank
    private String desig;

    private String descr;

    @NotBlank
    private String nif;

    private String email;

    private String telefone;

    private String endereco;

    private Integer geografiaId;

    private Integer prEnquadramentoId;

    private Integer prMoedaId;

    private String estado;
}
