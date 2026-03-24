package cv.igrp.fatura.fiscal_document.application.commands;

import cv.igrp.framework.core.domain.CommandHandler;
import cv.igrp.framework.stereotype.IgrpCommandHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@Component
public class SubmitDfeCommandHandler implements CommandHandler<SubmitDfeCommand, ResponseEntity<String>> {

   private static final Logger LOGGER = LoggerFactory.getLogger(SubmitDfeCommandHandler.class);

   public SubmitDfeCommandHandler() {

   }

   @IgrpCommandHandler
   public ResponseEntity<String> handle(SubmitDfeCommand command) {

      LOGGER.debug("SubmitDfeCommand : {}", command);

      // TODO: Implement the command handling logic here
      return null;
   }

}