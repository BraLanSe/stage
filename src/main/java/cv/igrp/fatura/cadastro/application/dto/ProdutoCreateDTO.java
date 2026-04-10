package cv.igrp.fatura.cadastro.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@IgrpDTO
public class ProdutoCreateDTO {

    private Integer id;

    @NotBlank
    private String codigo;

    @NotBlank
    private String desig;

    private String descr;

    private Integer prCategoriaId;

    private Integer prUnidadeId;

    private BigDecimal preco;

    private Integer impostoVendaId;

    private Integer impostoCompraId;

    private BigDecimal descontoComercial;

    private Boolean controlarStock;

    private Integer contaGlId;

    private Integer contaGlCompraId;

    private String estado;
}
