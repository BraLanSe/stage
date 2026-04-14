package cv.igrp.fatura.pagamento.application.commands;

import cv.igrp.framework.core.domain.Command;
import cv.igrp.fatura.pagamento.application.dto.PagamentoCreateDTO;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePagamentoCommand implements Command {

    @NotNull
    private PagamentoCreateDTO dto;
}
