import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetEvent = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx
      .switchToHttp()
      .getRequest();
    if (!data) return req.event;
    return req.event[data];
  },
);