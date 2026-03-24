/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.fiscal_document.interfaces.rest;

import cv.igrp.framework.stereotype.IgrpController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import cv.igrp.framework.core.domain.CommandBus;
import cv.igrp.fatura.fiscal_document.application.commands.*;


@IgrpController
@RestController
@RequestMapping(path = "api/v1/dfe")
@Tag(
    name = "FiscalDocument",
    description = "FiscalDocument"
)
public class FiscalDocumentController {

  
  private final CommandBus commandBus;

  public FiscalDocumentController(CommandBus commandBus) {
          
          this.commandBus = commandBus;
  }
   @PostMapping(
  )
  @Operation(
    summary = "Submit dfe",
    description = "Submit dfe",
    responses = {
      @ApiResponse(
          responseCode = "200",
          
          content = @Content(
              mediaType = "multipart/form-data",
              schema = @Schema(
                  implementation = String.class,
                  type = "String")
          )
      )
    }
  )
  
  public ResponseEntity<String> submitDfe(
    )
  {

      final var command = new SubmitDfeCommand();

      return commandBus.send(command);

  }

}