import { SpotifyRecommendationFeatureAveragesType } from "~/types/spotify";

export const getRecommendationFeaturesString = (
  features: SpotifyRecommendationFeatureAveragesType
) => {
  const output = new URLSearchParams();

  // Get the defined keys
  const keys = Object.keys(features);

  // Iterate the keys
  keys.forEach((key) => {
    // get the object for the key
    const data =
      features[key as keyof SpotifyRecommendationFeatureAveragesType];

    // Add the search param if all is defined
    if (
      data &&
      typeof data.min !== "undefined" &&
      typeof data.max !== "undefined" &&
      typeof data.average !== "undefined"
    ) {
      output.append(`min_${key}`, data.min.toString());
      output.append(`max_${key}`, data.max.toString());
      output.append(
        `target_${key}`,
        key !== "popularity" && key !== "key"
          ? (data.average / 100).toString()
          : data.average.toString()
      );
    }
  });

  // return the string
  return output.toString();
};
