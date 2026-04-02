import { Test, TestingModule } from '@nestjs/testing';
import { MyAppController } from './auth.controller';
import { MyAppService } from './auth.service';

describe('MyAppController', () => {
  let myAppController: MyAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MyAppController],
      providers: [MyAppService],
    }).compile();

    myAppController = app.get<MyAppController>(MyAppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(myAppController.getHello()).toBe('Hello World!');
    });
  });
});
