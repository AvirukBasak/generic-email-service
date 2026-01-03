import { Result, NetworkType } from "@/types/util";
import { ADataTransferObj } from "@/types/abstract";
import { DtoValidationError } from "@/types/errors";
import { IsInt, Min, ValidateNested } from "class-validator";
import { Exclude, Type } from "class-transformer";

interface ConstructorParams<T> {
  currentChunk: number;
  totalChunks: number;
  totalItems: number;
  items: T[];
}

export class ChunkingDTO<T extends ADataTransferObj> extends ADataTransferObj {
  @IsInt()
  @Min(0)
  currentChunk = 0;

  @IsInt()
  @Min(0)
  totalChunks = 0;

  @IsInt()
  @Min(0)
  totalItems = 0;

  @ValidateNested({ each: true })
  @Type((options) => (options?.newObject as ChunkingDTO<T>).itemsClass)
  items: T[];

  @Exclude()
  private itemsClass: typeof ADataTransferObj;

  private constructor(data: ConstructorParams<T>, tClass: typeof ADataTransferObj) {
    super();

    this.currentChunk = data.currentChunk;
    this.totalChunks = data.totalChunks;
    this.totalItems = data.totalItems;
    this.items = data.items;
    this.itemsClass = tClass;
  }

  static createGeneric<T extends ADataTransferObj>(
    data: ConstructorParams<T>,
    itemsClass: typeof ADataTransferObj
  ): Result<ChunkingDTO<T>, DtoValidationError> {
    return this.fromJsonWithGeneric<T>(data, itemsClass);
  }

  static fromJsonWithGeneric<T extends ADataTransferObj>(
    json: NetworkType,
    itemsClass: typeof ADataTransferObj
  ): Result<ChunkingDTO<T>, DtoValidationError> {
    const buildFieldResult = ADataTransferObj._buildDtoFields(json, { items: itemsClass });

    if (buildFieldResult.isErr) {
      return Result.err(buildFieldResult.error);
    }

    return ADataTransferObj._fromJson(new this(json as ConstructorParams<T>, itemsClass));
  }
}
