import { TnmModel } from "./tnm"

test("can be created", () => {
  const instance = TnmModel.create({})

  expect(instance).toBeTruthy()
})
