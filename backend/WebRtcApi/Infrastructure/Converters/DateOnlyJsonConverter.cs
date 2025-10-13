using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebRtcApi.Infrastructure.Converters
{
    // Converter for non-nullable DateOnly
    public class DateOnlyJsonConverter : JsonConverter<DateOnly>
    {
        private const string Format = "yyyy-MM-dd";

        public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s))
                    throw new JsonException("Cannot convert empty string to DateOnly.");

                if (DateOnly.TryParse(s, out var date))
                    return date;

                if (DateOnly.TryParseExact(s, Format, null, System.Globalization.DateTimeStyles.None, out date))
                    return date;

                throw new JsonException($"Unable to parse '{s}' as DateOnly.");
            }

            if (reader.TokenType == JsonTokenType.Null)
                throw new JsonException("Cannot convert null to DateOnly.");

            throw new JsonException($"Unexpected token parsing DateOnly. Token: {reader.TokenType}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString(Format));
        }
    }

    // Converter for nullable DateOnly
    public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
    {
        private const string Format = "yyyy-MM-dd";

        public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s))
                    return null;

                if (DateOnly.TryParse(s, out var date))
                    return date;

                if (DateOnly.TryParseExact(s, Format, null, System.Globalization.DateTimeStyles.None, out date))
                    return date;

                throw new JsonException($"Unable to parse '{s}' as DateOnly.");
            }

            throw new JsonException($"Unexpected token parsing DateOnly?. Token: {reader.TokenType}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString(Format));
            else
                writer.WriteNullValue();
        }
    }
}
