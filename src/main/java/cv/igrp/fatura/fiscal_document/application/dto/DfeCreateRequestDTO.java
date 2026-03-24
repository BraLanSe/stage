/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME */

package cv.igrp.fatura.fiscal_document.application.dto;

import cv.igrp.framework.stereotype.IgrpDTO;
import jakarta.validation.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor


@IgrpDTO
public class DfeCreateRequestDTO  {

  @NotBlank(message = "The field <iud> is required")
	@Size(min = 45, message = "The field length <iud> must be at least 45 characters")
	@Size(max = 45, message = "The field length <iud> cannot be more than 45 characters")
  
  private String iud ;
  @NotNull(message = "The field <issueDate> is required")
  
  private LocalDateTime issueDate ;
  @NotBlank(message = "The field <emitterTaxId> is required")
	@Size(min = 9, message = "The field length <emitterTaxId> must be at least 9 characters")
	@Size(max = 9, message = "The field length <emitterTaxId> cannot be more than 9 characters")
  
  private String emitterTaxId ;

}