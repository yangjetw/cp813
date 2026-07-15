import { Composition } from "remotion";
import { PrincipleBarRace } from "./PrincipleBarRace";

export const Root = () => {
  return (
    <Composition
      id="PrincipleBarRace"
      component={PrincipleBarRace}
      durationInFrames={3300}
      fps={60}
      width={1920}
      height={1080}
    />
  );
};
