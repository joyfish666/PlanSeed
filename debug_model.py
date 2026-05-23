"""
模型兼容性调试脚本

用法：
  python debug_model.py <API_KEY> <API_ENDPOINT> <MODEL>

示例：
  python debug_model.py sk-xxx https://api.deepseek.com/v1 deepseek-chat
  python debug_model.py sk-xxx https://api.openai.com/v1 gpt-4o-mini
"""

import sys
import json
import urllib.request
import urllib.error


def test_model(api_key: str, api_endpoint: str, model: str) -> None:
    url = f"{api_endpoint.rstrip('/')}/chat/completions"

    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": "你是一个测试助手，请用一句话回答。"},
            {"role": "user", "content": "你好，请回复'模型调用成功'。"},
        ],
        "stream": False,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    print(f"测试模型: {model}")
    print(f"API Endpoint: {url}")
    print("-" * 40)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            content = body["choices"][0]["message"]["content"]
            print(f"[成功] 状态码: {resp.status}")
            print(f"[成功] 模型返回: {content}")
            print(f"[成功] 完整响应:\n{json.dumps(body, ensure_ascii=False, indent=2)}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"[失败] HTTP {e.code}: {e.reason}")
        print(f"[失败] 响应内容: {error_body}")
    except urllib.error.URLError as e:
        print(f"[失败] 网络错误: {e.reason}")
    except Exception as e:
        print(f"[失败] 未知错误: {type(e).__name__}: {e}")


def test_stream(api_key: str, api_endpoint: str, model: str) -> None:
    url = f"{api_endpoint.rstrip('/')}/chat/completions"

    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": "你是一个测试助手。"},
            {"role": "user", "content": "用一句话介绍你自己。"},
        ],
        "stream": True,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    print(f"\n流式测试: {model}")
    print("-" * 40)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            full_content = ""
            buffer = ""
            for chunk in iter(lambda: resp.read(1024), b""):
                buffer += chunk.decode("utf-8", errors="replace")
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        obj = json.loads(data)
                        delta = obj.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        if delta:
                            full_content += delta
                    except json.JSONDecodeError:
                        pass
            print(f"[成功] 流式输出: {full_content}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"[失败] HTTP {e.code}: {e.reason}")
        print(f"[失败] 响应内容: {error_body}")
    except Exception as e:
        print(f"[失败] {type(e).__name__}: {e}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    key, endpoint, model = sys.argv[1], sys.argv[2], sys.argv[3]
    test_model(key, endpoint, model)
    test_stream(key, endpoint, model)
