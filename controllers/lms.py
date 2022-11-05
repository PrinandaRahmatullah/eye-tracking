import sys

from flask import request, current_app, Blueprint, redirect, render_template
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException, NotFound

sys.path.insert(0, '../services')

current_app.config.update(
    # MAX_CONTENT_LENGTH=5 * 1024 * 1024,
    UPLOAD_EXTENSIONS=['.jpeg', '.jpg', '.png'],
    UPLOAD_PATH='uploads'
)

lms_blueprint = Blueprint('lms', __name__)


@lms_blueprint.route('/tiny_face_detector_model-weights_manifest.json', methods=['GET', 'POST'])
def load_weights():
    return redirect("/static/models/tiny_face_detector_model-weights_manifest.json")


@lms_blueprint.route('/tiny_face_detector_model-shard1', methods=['GET', 'POST'])
def load_shard1():
    return redirect("/static/models/tiny_face_detector_model-shard1")


@lms_blueprint.route('/')
def lms_distance():
    return render_template('distance.html')


@lms_blueprint.route('/lms')
def lms_index():
    return render_template('custom.html')


@lms_blueprint.route('/pure')
def lms_eye():
    return render_template('calibration.html')


@lms_blueprint.route('/face')
def lms_face():
    return render_template('face.html')


@lms_blueprint.route('/integrate', methods=['GET', 'POST'])
def lms_integration():
    return render_template('integration.html')
