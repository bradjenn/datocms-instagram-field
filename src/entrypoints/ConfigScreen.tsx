import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Canvas, TextField, Form, Button } from "datocms-react-ui";
import { useState } from "react";
import s from "./styles.module.css";

type Props = {
  ctx: RenderConfigScreenCtx;
};

// configuration object starts as an empty object
type FreshInstallationParameters = {
  accessToken: string;
  expiresIn: string;
};

// this is how we want to save our settings
type ValidParameters = { accessToken: string; expiresIn: string };

// parameters can be either empty or filled in
export type Parameters = FreshInstallationParameters | ValidParameters;

export default function ConfigScreen({ ctx }: Props) {
  const parameters = ctx.plugin.attributes.parameters as Parameters;

  const [accessToken, updateAccessToken] = useState(parameters.accessToken);
  const [expiresIn, updateExpiresIn] = useState(parameters.expiresIn);

  const fetchNewToken = async () => {
    try {
      const newToken = await refreshToken(accessToken);

      updateAccessToken(newToken.access_token);
      updateExpiresIn(newToken.expires_in);

      ctx.updatePluginParameters({
        accessToken: newToken.access_token,
        expiresIn: newToken.expires_in,
      });

      ctx.notice("Token Refreshed successfully!");
    } catch (error) {
      console.error(2, error);
      ctx.alert("Token is invalid");
    }
  };

  const refreshToken = async (accessToken: string) => {
    const params = new URLSearchParams();
    params.append("grant_type", "ig_refresh_token");
    params.append("access_token", accessToken);

    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?${params.toString()}`
    );
    const data = await response.json();
    return data;
  };

  return (
    <Canvas ctx={ctx}>
      {!expiresIn && (
        <div className={s.inspector}>
          <Form onSubmit={fetchNewToken}>
            <TextField
              required
              name="accessToken"
              id="accessToken"
              label="Instagram Access Token"
              value={accessToken}
              hint="Enter an access token to begin"
              textInputProps={{ monospaced: true }}
              onChange={(newValue) => updateAccessToken(newValue)}
            />

            <Button buttonType="primary" type="submit">
              Save
            </Button>
          </Form>
        </div>
      )}

      <div>
        {accessToken && expiresIn && (
          <>
            <p>
              <b>Access Token:</b> {accessToken}
            </p>
            <p>
              <b>Expires in:</b> {expiresIn}
            </p>

            <Button onClick={fetchNewToken} buttonSize="xxs">
              Refresh Token
            </Button>
          </>
        )}
      </div>
    </Canvas>
  );
}
