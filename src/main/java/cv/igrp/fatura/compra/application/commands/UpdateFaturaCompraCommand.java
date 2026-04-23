package cv.igrp.fatura.compra.application.commands;

import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.framework.core.domain.Command;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFaturaCompraCommand implements Command {

    @NotNull
    private Integer id;

    @NotNull
    private FaturaCompraCreateDTO dto;
}
