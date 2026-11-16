from bson import ObjectId

def serialize_doc(doc: dict) -> dict:
    if not doc:
        return {}
    res = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            res[k] = str(v)
        elif isinstance(v, list):
            res[k] = [serialize_doc(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
        elif isinstance(v, dict):
            res[k] = serialize_doc(v)
        else:
            res[k] = v
    if "_id" in res and "id" not in res:
        res["id"] = res["_id"]
    return res

def serialize_docs(docs: list) -> list:
    return [serialize_doc(d) for d in docs]
