from flask import Flask, request, jsonify
from flask_restful import Api

# initialize flask and register extensions
app = Flask(__name__)
api = Api(app)
app.url_map.strict_slashes = False


# because in controller need access the flask current context/app
with app.app_context():
    # ktp_ocr_blueprint, face_verif_blueprint, home_blueprint, king_foto_blueprint
    from controllers import lms_blueprint
    app.register_blueprint(lms_blueprint, url_prefix='/')
    # app.register_blueprint(ktp_ocr_blueprint, url_prefix='/uploadKtp')
    # app.register_blueprint(face_verif_blueprint, url_prefix='/faceUpload')
