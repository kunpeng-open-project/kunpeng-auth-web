import { removeEmptyAndNull } from "@/utils/json"
import { Emitter } from "mitt"
import { PageData } from "@/utils/data/systemData"

export function kpSelectChange(eventBus: Emitter<any>, queryParams: PageData) {
  queryParams.pageNum = 1
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}