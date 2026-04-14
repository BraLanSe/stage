package cv.igrp.fatura.cadastro.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class FornecedorCreateDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    private Boolean indColetivo;

    @NotBlank
    private String desig;

    private String descr;

    private String nif;

    private String numCliente;

    private String email;

    private String telefone;

    private Integer geografiaId;

    private String pais;

    private String endereco;

    private String pessoaContacto;

    private Boolean aplicarImpostos;

    private String motivoNaoAplicarImposto;

    private Integer prEnquadramentoId;

    private Integer contaGlId;

    private String estado;
}
