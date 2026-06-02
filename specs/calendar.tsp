import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@doc("UUID идентификатор")
scalar uuid extends string;

@doc("Дата и время в UTC")
scalar UtcDateTime extends string;

@doc("Тип события, создаваемый владельцем календаря")
model EventType {
  id: uuid;
  title: string;
  description: string;
  duration: int32;
}

@doc("Бронирование, созданное гостем на выбранный слот")
model Booking {
  id: uuid;
  eventTypeId: uuid;
  guestName: string;
  guestEmail: string;
  startTime: UtcDateTime;
  endTime: UtcDateTime;
  createdAt: UtcDateTime;
}

@doc("Запрос на создание типа события")
model CreateEventTypeRequest {
  title: string;
  description: string;
  duration: int32;
}

@doc("Запрос на обновление типа события")
model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  duration?: int32;
}

@doc("Запрос на создание бронирования")
model CreateBookingRequest {
  eventTypeId: uuid;
  guestName: string;
  guestEmail: string;
  startTime: UtcDateTime;
}

@doc("Свободный временной слот")
model Slot {
  startTime: UtcDateTime;
  endTime: UtcDateTime;
}

@doc("Бронирование пересекается с существующим")
model ConflictError {
  code: "CONFLICT";
  message: string;
}

@doc("Ресурс не найден")
model NotFoundError {
  code: "NOT_FOUND";
  message: string;
}

@doc("Ошибка валидации входных данных")
model ValidationError {
  code: "VALIDATION_ERROR";
  message: string;
  details: string[];
}

@service(#{
  title: "Calendar API",
})
namespace CalendarApi {

  @route("/api/event-types")
  interface EventTypes {

    @doc("Получить список всех типов событий (публично)")
    @get op list(): EventType[];

    @doc("Получить тип события по ID (публично)")
    @get op getEventType(@path id: uuid): EventType | NotFoundError;

    @doc("Создать новый тип события (admin)")
    @post op create(@body body: CreateEventTypeRequest): EventType | ValidationError;

    @doc("Обновить существующий тип события (admin)")
    @patch op update(
      @path id: uuid,
      @body body: UpdateEventTypeRequest
    ): EventType | NotFoundError | ValidationError;

    @doc("Удалить тип события (admin)")
    @delete op delete(@path id: uuid): void | NotFoundError;
  }

  @doc("Получить свободные слоты для типа события")
  @route("/api/event-types/{id}/slots")
  interface Slots {

    @doc("Возвращает свободные слоты в указанном диапазоне дат")
    @get op getAvailableSlots(
      @path id: uuid,
      @doc("Начало окна (UTC)")
      @query from: UtcDateTime,
      @doc("Конец окна (UTC)")
      @query to: UtcDateTime
    ): Slot[] | NotFoundError;
  }

  @route("/api/bookings")
  interface Bookings {

    @doc("Получить список всех будущих броней (admin)")
    @get op list(): Booking[];

    @doc("Создать новое бронирование (гость)")
    @post op create(
      @body body: CreateBookingRequest
    ): Booking | ConflictError | ValidationError;
  }
}
